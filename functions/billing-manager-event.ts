import { CloudBillingClient } from '@google-cloud/billing';
import { Firestore } from '@google-cloud/firestore';
import { http } from '@google-cloud/functions-framework';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const COLLECTION_NAME = process.env.STORAGE_COLLECTION;
const billing = new CloudBillingClient();

const isBillingEnabled = async (projectName: string) => {
  try {
    const [res] = await billing.getProjectBillingInfo({ name: projectName });
    return res.billingEnabled;
  } catch (e) {
    console.log(
      'Unable to determine if billing is enabled on specified project, assuming billing is enabled'
    );
    return true;
  }
};

const disableBillingForProject = async (projectName: string) => {
  const [res] = await billing.updateProjectBillingInfo({
    name: projectName,
    projectBillingInfo: { billingAccountName: '' },
  });
  return `Billing disabled: ${JSON.stringify(res)}`;
};

http('entryPoint', async (req, res) => {
  try {
    const db = new Firestore({ projectId: PROJECT_ID });

    if (!COLLECTION_NAME) {
      const result = await disableBillingForProject(PROJECT_NAME);
      return res.send(result);
    }

    const dataRef = db.collection(COLLECTION_NAME);

    const d = new Date();
    const dateArg = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const id = `${new Date(dateArg).getTime()}`;

    const document = await dataRef.doc(id).get();

    if (!document.exists) {
      await dataRef.doc(id).set({ count: 1 });
      return res.send(`No action necessary.`);
    }

    if (document.get('count') && document.get('count') <= 3) {
      await dataRef.doc(id).update({ count: document.get('count') + 1 });
      return res.send(`No action necessary.`);
    }

    const billingEnabled = await isBillingEnabled(PROJECT_NAME);

    if (billingEnabled) {
      const result = await disableBillingForProject(PROJECT_NAME);
      return res.send(result);
    }

    return res.send('Billing already disabled');
  } catch (e) {
    const result = await disableBillingForProject(PROJECT_NAME);
    return res.send(result);
  }
});
