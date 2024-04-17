import { assert } from "chai";
import {
  nameValidationExp,
  emailValidationExp,
  urlValidationExp,
  tmosAdminPasswordValidationExp,
  reservedSubnetNameExp,
  commaSeparatedIpListExp,
  sshKeyValidationExp
} from "../client/src/lib/constants.js";
const slzExpressions = {
  nameValidationExp: /^[A-z]([a-z0-9-]*[a-z0-9])?$/i,
  emailValidationExp: /^[\w\d_\.\-]+@([\w\d_-]+\.){1,4}[\w\d]+$/g,
  urlValidationExp:
    /(ftp|https?):\/\/(www\.)?([^"\/]+\.)([^"\/]+\.)+[^"\/.]+\/[^ "]*$/g,
  tmosAdminPasswordValidationExp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{15,}$/,
  reservedSubnetNameExp:
    /^(f5-external|f5-workload|f5-management|f5-bastion|vpn-1|vpn-2|.*zone.*)$/g,
  commaSeparatedIpListExp:
    /^((\b((25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2})\b((\/(3[0-2]|[012]?\d)))?))*(,\s*\b((25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2})\b((\/(3[0-2]|[012]?\d)))?)*$/gm,
  sshKeyValidationExp: /^ssh-rsa AAAA[0-9A-Za-z+/]+([=]{0,3})?$/g,
};

describe("slz regex tests", () => {
  it("should match comma separated ip list exp using RegexButWithWords", () => {
    assert.deepEqual(
      commaSeparatedIpListExp,
      slzExpressions.commaSeparatedIpListExp,
      "they should match"
    );
  });
  it("should match name validation exp using RegexButWithWords", () => {
    assert.deepEqual(
      nameValidationExp,
      slzExpressions.nameValidationExp,
      "they should match"
    );
  });
  it("should match email validation exp using RegexButWithWords", () => {
    assert.deepEqual(
      emailValidationExp,
      slzExpressions.emailValidationExp,
      "they should match"
    );
  });
  it("should match url validation exp using RegexButWithWords", () => {
    assert.deepEqual(
      urlValidationExp,
      slzExpressions.urlValidationExp,
      "they should match"
    );
  });
  it("should match tmos admin password validation exp using RegexButWithWords", () => {
    assert.deepEqual(
      tmosAdminPasswordValidationExp,
      slzExpressions.tmosAdminPasswordValidationExp,
      "they should match"
    );
  });
  it("should match reserved subnet name exp using RegexButWithWords", () => {
    assert.deepEqual(
      reservedSubnetNameExp,
      slzExpressions.reservedSubnetNameExp,
      "they should match"
    );
  });
  it("should match sshKey validation exp using RegexButWithWords", () => {
    assert.deepEqual(
      sshKeyValidationExp,
      slzExpressions.sshKeyValidationExp,
      "they should match"
    );
  });
});
