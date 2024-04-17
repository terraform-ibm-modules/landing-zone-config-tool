# Compatibility Tests

generate-overrides.js is used to create override.json that can be used with the corresponding SLZ pattern to determine if this tool is creating usable output.

## Generate an Override

1. Run `node generate-overrides.js <PATTERN>` to create the file `./patterns/<PATTERN>/override.json`.

2. Copy this file to `<main SLZ repo>/patterns/<PATTERN>`.

3. Set the required variables, either manually or through `terraform.tfvars` like so:
```
# slzgui compatibility tests
prefix   = "slzgui"
override = true
region = "us-south"
####
```

4. Run `terraform plan`. If it generates a plan without errors, the test is considered a success.

The overrides for all patterns can be generated at the same time from the root of this repo with `npm run compatibility-tests`.
