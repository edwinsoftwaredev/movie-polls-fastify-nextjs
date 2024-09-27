import json
import os
from datetime import date, datetime

import functions_framework
from google.cloud import billing, firestore


def __is_billing_enabled(project_name: str, client: billing.CloudBillingClient):
    try:
        request = billing.GetProjectBillingInfoRequest(name=project_name)
        response = client.get_project_billing_info(request=request)
        return response.billing_enabled

    except BaseException:
        print(
            "Unable to determine if billing is enabled on specified project, assuming billing is enabled"
        )
        return True


def __disable_billing_for_project(
    project_name: str, client: billing.CloudBillingClient
):

    billing_info = billing.ProjectBillingInfo(billing_account_name='')

    request = billing.UpdateProjectBillingInfoRequest(
        name=project_name,
        project_billing_info=billing_info
    )

    response = client.update_project_billing_info(request=request)

    return f"Billing disabled: {response.billing_enabled}"


@functions_framework.http
def fn(req):
    billing_client = billing.CloudBillingClient()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    project_name = f"projects/{project_id}"
    collection_name = os.getenv("STORAGE_COLLECTION")

    try:
        db = firestore.Client(project=project_id)

        if not collection_name:
            response = __disable_billing_for_project(
                project_name, billing_client)
            return response

        data_ref = db.collection(collection_name)
        now = date.today()
        id = str(int(datetime(now.year, now.month, now.day).timestamp()))

        doc_ref = data_ref.document(document_id=id)
        doc = doc_ref.get()

        if not doc.exists:
            doc_ref.set({"count": 1})
            return "No action necessary."

        if doc.exists and doc.get("count") <= 3:
            doc_ref.update({"count": firestore.Increment(1)})
            return "No action necessary"

        billing_enabled = __is_billing_enabled(project_name, billing_client)

        if billing_enabled:
            response = __disable_billing_for_project(
                project_name, billing_client)
            return response

        return "Billing already disabled"

    except BaseException:
        response = __disable_billing_for_project(project_name, billing_client)
        return response
