import base64
import json
import os

from google.cloud import billing


def __is_billing_enabled(
    project_name: str,
    client: billing.CloudBillingClient,
):
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
    project_name: str,
    client: billing.CloudBillingClient,
):
    billing_info = billing.ProjectBillingInfo(billing_account_name='')

    request = billing.UpdateProjectBillingInfoRequest(
        name=project_name,
        project_billing_info=billing_info
    )

    response = client.update_project_billing_info(request=request)

    return f"Billing disabled: {response.billing_enabled}"


def fn(pubsub_event, context):
    billing_client = billing.CloudBillingClient()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    project_name = f"projects/{project_id}"

    try:
        pubsub_data = base64.b64decode(
            pubsub_event["data"]).decode(encoding="utf-8")
        pubsub_data = json.loads(pubsub_data)
        cost_amount = pubsub_data["costAmount"]
        budget_amount = pubsub_data["budgetAmount"]

        if cost_amount <= budget_amount:
            return f"No action necessary. (Current cost: {cost_amount})"

        billing_enabled = __is_billing_enabled(
            project_name=project_name,
            client=billing_client,
        )

        if billing_enabled:
            response = __disable_billing_for_project(
                project_name=project_name,
                client=billing_client,
            )

            return response

        return "Billing already disabled"

    except BaseException:
        response = __disable_billing_for_project(project_name, billing_client)

        return response
