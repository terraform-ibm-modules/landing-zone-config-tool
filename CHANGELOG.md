# Changelog

All notable changes to this project will be documented in this file.

## 0.9.0

### Features

- Added development cheat code to allow developers to enter form debug mode easier
- Added a button to the f5 password input that generates a password for the user
- Added release notes page
- Added automated CHANGELOG.md creation
- Users can now scale the number of availability zones for starting infrastructure when using a default pattern once a pattern has been selected
- Added `helperText` prop to SlzNumberSelect and SlzSelect
- Added `disabled` prop to SlzNubmerSelect
- Added modal prompt to notify users when disabling Activity Tracker Route that doing so will result in an environment that is not FS Cloud Compliant.

### Fixes

- Fixed an issue that caused the home page to not load

## 0.8.0

### Features

- Import JSON/Summary text boxes now use monospace font
- Added a modal that requires users to select a pattern at start
- Added a modal that tells the user their configuration will be reset if they change patterns after any customization
- Created the ability to generate all documents as a single markdown file
- Refactored many components and added PropTypes and default props
- Improved f5 documentation
- Update lazy-z for new helper functions
- Consolidated form templates into only one type of ToggleForm
- Added a character count on the summary page
- Added information to the summary page telling them about the max length of override.json for a schematics workspace
- Added different stores for development and production
- Created a backend for slzgui

### Fixes

- Fixed validation so importing custom json no longer causes errors. Clusters now allow a null kms key, vsi & vpe now allow null resource group. Adds appid, secrets_manager, security_compliance_center, iam_account_settings, to override.json if missing at time of validation
- Selecting a new pattern on the home page resets state now
- Fixed an issue where a new form would open after deleting a component
- Fixed an issue where resource forms were not forced open after a resource that used them was deleted
- Fixed alignment of the "Use Pretty JSON" toggle on the summary page
- Fixed a bug that caused the IAM Account Settings page to not load
- Fixed an issue where networking rule port value types were inconsistent
- Users can no longer toggle "Use public gateway" if a gatway has not been created in that zone

## 0.7.0

### Features

- Increased the widths of multiselect items so longer items are readable
- Added documentation to the f5 page
- Improved composed name helper text on form fields to be responsive
- Updated styling on f5 page
- Changed favicon
- Added tooltip for VSI Security Groups
- Removed public gateways from VPC subnets page
- Added hover popups to add, delete, and save buttons
- Added a magnifying glass to images that can be opened in a new tab

### Fixes

- Fixed an issue where titles on the side navigation were covered and unreadable
- Fixed an issue where terraform plan failed when account management policies were empty
- Changed order of components on forms to make all forms consistent
- Fixed a bug where hovering over components would not show their correct value

## 0.6.0

### Features

- Renamed Network ACLs to "VPC Access Control"
- Added a save button to VSI security group networking rules
- Removed [GUI] from top nav bar
- Added an API key from the service ID generated in generate_serviceid.sh
- Added support for Access Groups, Access Group Policies, and Access Group Dynamic Policies
- Added input validation on the f5 page

### Fixes

- Fixed a bug where the first network acl was always open
- Fixed a bug where form fields in the Security & Compliance Center page were shown as JSON titles
- Updated optional components so that form titles are consistent
- Renamed components so footer and form titles are now consistent
- All links now open in a new tab
- Fixed kerning/spacing on documentation so that it is more readable
- Resolved issues with components not taking up the full page width
