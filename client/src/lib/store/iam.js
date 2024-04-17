/**
 * initialize iam account settings
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function iamInit(slz) {
  slz.store.configDotJson.iam_account_settings = {
    // these values should be validated in the FE component as most can use dropdowns
    enable: false,
    mfa: null, // must be one of ["NONE", "TOTP", "TOTP4ALL", "LEVEL1", "LEVEL2", "LEVEL3", "null"]
    allowed_ip_addresses: null, // must be comma separated list of ips on submit
    include_history: null,
    if_match: null, // must be NOT_SET or integer > 0
    max_sessions_per_identity: null, // must be NOT_SET or integer > 0
    restrict_create_service_id: null, // must be one of ["NOT_SET", "RESTRICTED", "NOT_RESTRICTED"]
    restrict_create_platform_apikey: null, // must be one of ["NOT_SET", "RESTRICTED", "NOT_RESTRICTED"]
    session_expiration_in_seconds: null, // must be `NOT_SET` or number between 900 and 86400
    session_invalidation_in_seconds: null // must be `NOT_SET` or number between 900 and 7200
  };
}

/**
 * save iam account settings
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.iam_account_settings
 * @param {object} stateData component state data
 * @param {boolean} stateData.enable
 */
function iamSave(slz, stateData) {
  if (stateData.enable === false)
    [
      "mfa",
      "allowed_ip_addresses",
      "include_history",
      "if_match",
      "max_sessions_per_identity",
      "restrict_create_service_id",
      "restrict_create_platform_apikey",
      "session_expiration_in_seconds",
      "session_invalidation_in_seconds"
    ].forEach(field => {
      stateData[field] = null;
    });
  slz.store.configDotJson.iam_account_settings = stateData;
}

export {
  iamInit,
  iamSave
};
