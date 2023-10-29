import functions from '@google-cloud/functions-framework';
import { CloudBillingClient } from '@google-cloud/billing';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
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

export const billingManagerNotification = async (pubsubEvent: any) => {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data ?? '', 'base64').toString()
  );

  if (Number(pubsubData.costAmount) === 0)
    return `No action necessary. (Current cost: ${pubsubData.costAmount}})`;

  const billingEnabled = await isBillingEnabled(PROJECT_NAME);

  if (billingEnabled) {
    return disableBillingForProject(PROJECT_NAME);
  }

  return 'Billing already disabled';
};
