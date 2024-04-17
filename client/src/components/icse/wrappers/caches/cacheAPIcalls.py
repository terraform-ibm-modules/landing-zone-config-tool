########
#
# Creates local copies of API calls the original GUI made in real time. Run this periodically to regenerate cached data.
# `python3 cacheAPIcalls.py` (either have IBMCLOUD_API_KEY env var set or pass it as the first argument)
# Some API calls did not work through curl which is why this isn't a shell script.
#
########

import json
import os
import sys
from datetime import date

import requests


def get_token(ibmcloud_api_key):
    url = "https://iam.cloud.ibm.com/identity/token"

    payload = f"grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey={ibmcloud_api_key}"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    access_token = json.loads(response.text)["access_token"]
    return access_token


def call_api(url, access_token):
    payload = {}
    headers = {
        "Accept": f"Bearer {access_token}",
        "Accept-Encoding": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    results = ""
    while True:
        response = requests.request("GET", url, headers=headers, data=payload)
        if response.status_code == 404:
            break
        else:
            results += response.text
            if response.links and "next" in response.links.keys():
                url = response.links["next"]["url"]
            else:
                break

    return results


if __name__ == "__main__":
    # YYYY-MM-DD
    today = date.today().strftime("%Y-%m-%d")

    ibmcloud_api_key = os.environ.get("IBMCLOUD_API_KEY", None)
    if not ibmcloud_api_key:
        ibmcloud_api_key = sys.argv[1]

    access_token = get_token(ibmcloud_api_key)

    json_map = {}
    json_map["clusterFlavors"] = json.loads(
        call_api(
            "http://containers.cloud.ibm.com/global/v2/getFlavors?zone=us-south-1&provider=vpc-gen2",
            access_token,
        )
    )
    json_map["clusterVersions"] = json.loads(
        call_api("http://containers.cloud.ibm.com/global/v1/versions", access_token)
    )
    json_map["vsiImages"] = json.loads(
        call_api(
            f"http://us-south.iaas.cloud.ibm.com/v1/images?version={today}&generation=2&status=available&limit=100",
            access_token,
        )
    )
    json_map["vsiInstanceProfiles"] = json.loads(
        call_api(
            f"http://us-south.iaas.cloud.ibm.com/v1/instance/profiles?version={today}&generation=2",
            access_token,
        )
    )

    # send to files
    for file in [
        "clusterFlavors",
        "clusterVersions",
        "vsiImages",
        "vsiInstanceProfiles",
    ]:
        prefix_string = f"export const {file} = "
        file_string = (
            prefix_string + json.dumps(json_map[file]) + " //pragma: allowlist secret\n"
        )
        f = open(file + ".js", "w")
        f.write(file_string)
        f.close()
