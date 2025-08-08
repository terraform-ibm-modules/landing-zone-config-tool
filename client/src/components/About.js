import "./about.scss";
import vsi from "../images/vsi.png";
import roks from "../images/roks.png";
import vpc from "../images/vpc.png";

const About = () => {
  return (
    <div className="about">
      <h1 id="what-is-secure-landing-zone-">
        What is IBM Secure Landing Zone?
      </h1>
      <p>
        <a
          href="https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone?tab=readme-ov-file#ibm-secure-landing-zone-module"
          target="_blank"
          rel="noopener noreferrer"
        >
          IBM Secure Landing Zone
        </a>{" "}
        provides users with the ability to create a fully customizable,{" "}
        <a
          href="https://www.ibm.com/cloud/financial-services"
          target="_blank"
          rel="noopener noreferrer"
        >
          FS Cloud Compliant
        </a>{" "}
        Virtual Private Cloud (VPC) environment within a single region.
      </p>
      <h3 id="1-select-your-pattern">1. Select your pattern</h3>
      <p>
        The three patterns below are each starter templates that can be used to
        quickly get started with Landing Zone.
      </p>
      <table>
        <thead>
          <tr>
            <th>VSI on VPC landing zone</th>
            <th>Red Hat Openshift Container Platform on VPC landing zone</th>
            <th>VPC landing zone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <img src={vsi} alt="vsi" />
            </td>
            <td>
              <img src={roks} alt="roks" />
            </td>
            <td>
              <img src={vpc} alt="vpc" />
            </td>
          </tr>
        </tbody>
      </table>
      <p>By customizing the override.json, you can create the following:</p>
      <ul>
        <li>A resource group for cloud services and for each VPC.</li>
        <li>Object storage instances for flow logs and activity tracker</li>
        <li>
          Encryption keys in either a Key Protect or Hyper Protect Crypto
          Services instance
        </li>
        <li>A management and workload VPC connected by a transit gateway</li>
        <li>A flow log collector for each VPC</li>
        <li>All necessary networking rules to allow communication</li>
        <li>Virtual private endpoints for Cloud Object Storage in each VPC</li>
        <li>A VPN Gateway in the Management VPC</li>
      </ul>
      <p>Each pattern will create an identical deployment on the VPC</p>
      <ul>
        <li>
          Virtual Server (VSI) Pattern will deploy identical virtual servers
          across the VSI subnet tier in each VPC
        </li>
        <li>
          Red Hat OpenShift Kubernetes (ROKS) Pattern will deploy identical
          clusters across the VSI subnet tier in each VPC
        </li>
        <li>
          The VPC pattern will provision neither virtual servers nor clusters
        </li>
      </ul>
      <hr />
      <h3 id="2-customizing-your-environment">2. Customize your environment</h3>
      <p>
        There are two ways of customizing your environment with Secure Landing
        Zone.{" "}
      </p>
      <p>
        <strong>
          <em>
            Both require editing <code>terraform.tfvars</code> with required
            variables noted by{" "}
            <code>&quot;&lt; add user data here &gt;&quot;</code>
          </em>
        </strong>
      </p>
      <h4 id="-using-terraform-tfvars-">
        <strong>Using terraform.tfvars</strong>
      </h4>
      <p>
        The first route is to utilize the fast path method where you edit a
        couple of required variables noted by{" "}
        <code>&quot;&lt; add user data here &gt;&quot;</code> within the{" "}
        <code>terraform.tfvars</code> file of your respective pattern and then
        provision the environment. You will always be able to edit and be more
        granular after you use this method since after the run, it will output a
        json based file which you can use in <code>override.json</code>.
      </p>
      <p>
        For example, additional VPC&#39;s can be added using the{" "}
        <code>terraform.tfvars</code> file by adding the name of the new VPC as
        a <code>string</code> to the end of the list.
      </p>
      <pre>
        <code>
          <span className="hljs-attr">vpcs</span> = [
          <span className="hljs-string">"management"</span>,{" "}
          <span className="hljs-string">"workload"</span>,{" "}
          <span className="hljs-string">"&lt;ADDITIONAL VPC&gt;"</span>]
        </code>
      </pre>
      <h4 id="-using-override-json-">
        <strong>Using override.json</strong>
      </h4>
      <p>
        The second route is to use the <code>override.json</code> to create a
        fully customized environment based on the starting template. By default,
        each pattern&#39;s <code>override.json</code> is set to contain the
        default environment configuration. Users can use the{" "}
        <code>override.json</code> in the respective pattern directory by
        setting the template <code>override</code> variable to <code>true</code>
        . Each value in <code>override.json</code> corresponds directly to a
        variable value from the Landing Zone Module which each pattern uses to
        create your environment.
      </p>
      <h4 id="supported-variables">Supported Variables</h4>
      <p>
        The <code>override.json</code> allows users to pass any variable or
        supported optional variable attributes from the Landing Zone Module,
        which each pattern uses to provision infrastructure.
      </p>
      <h4 id="overriding-variables">Overriding Variables</h4>
      <p>
        After every execution of <code>terraform apply</code> either locally or
        through the pipeline, a JSON encoded definition of your environment
        based on the defaults for Landing Zone and any variables changed using{" "}
        <code>override.json</code> will be outputted so that you can then use it
        in the <code>override.json</code> file.{" "}
      </p>
      <ul>
        <li>
          <p>
            For pipeline runs, you can get the contents within the step labeled{" "}
            <code>workspace-apply</code> under the output line{" "}
            <strong>Results for override.json:</strong>
          </p>
        </li>
        <li>
          <p>
            For locally executed runs, you can get the contents between the
            output lines of:
          </p>
          <pre>
            <code>
              <span className="hljs-attribute">config</span> = &lt;&lt;EOT EOT
            </code>
          </pre>
        </li>
      </ul>
      <p>
        After replacing the contents of <code>override.json</code> with your
        configuration, you will be able to then edit the resources within.
        Please make use you set the template <code>override</code> variable to{" "}
        <code>true</code> with the <code>terraform.tfvars</code> file.
      </p>
      <p>
        Locally executed run configurations do not require an apply to for{" "}
        <code>override.json</code> to be generated. To view your current
        configuration use the command <code>terraform refresh</code>.
      </p>
      <h4 id="overriding-only-some-variables">
        Overriding Only Some Variables
      </h4>
      <p>
        <code>override.json</code> does not need to contain all elements.
      </p>
      <hr />
      <h3 id="3-provisioning-method">3. Select your provisioning method</h3>
      <h4 id="provision-via-toolchain">Provision via Toolchain</h4>
      <p>
        Steps to set up toolchain{" "}
        <a
          href="https://us-south.git.cloud.ibm.com/open-toolchain/landing-zone/tree/main#provisioning-with-the-ibm-cloud-toolchain"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        <br />
        <a
          href="https://cloud.ibm.com/devops/setup/deploy?repository=https%3A%2F%2Fus-south.git.cloud.ibm.com%2Fopen-toolchain%2Flanding-zone&amp;env_id=ibm:yp:us-south"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Toolchain tile on IBM Cloud
        </a>
      </p>
      <h4 id="provision-via-locally-run-scripts">
        Provision via locally run scripts
      </h4>
      <p>To run the scripts locally, follow these steps:</p>
      <ol>
        <li>
          Install Terraform CLI and IBM Cloud Provider plug-in with{" "}
          <a
            href="https://cloud.ibm.com/docs/ibm-cloud-provider-for-terraform?topic=ibm-cloud-provider-for-terraform-getting-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            these steps
          </a>
          . <strong>Note: version &gt;= 1.0 is required</strong>
        </li>
        <li>
          Install{" "}
          <a
            href="https://www.python.org/downloads/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Python
          </a>
          .
        </li>
        <li>
          Select the pattern that you want to provision (vsi/roks/vpc) within
          the patterns directory.
        </li>
        <li>
          Provide your <code>tfvars</code> file with required variables, such as
          prefix, region, etc.
        </li>
        <li>
          Provide your IBM Cloud API key through an environment variable (ex:
          export TF_VAR_ibmcloud_api_key=&quot;Your IBM Cloud API Key)
        </li>
        <li>
          Run <code>terraform init</code> to initialize the working directory
          and configuration.
        </li>
        <li>
          Run <code>terraform plan</code> to preview the changes that Terraform
          plans to make to your infrastructure.
        </li>
        <li>
          Run <code>terraform apply</code> to execute the plan to create or
          modify your infrastructure.
        </li>
        <li>
          Once you no longer need the infrastructure, you can run{" "}
          <code>terraform destroy</code> to delete the resources.
        </li>
      </ol>
      <hr />
      <h3>4. Enabling optional features</h3>
      <h4 id="-optional-f5-big-ip">F5 BIG-IP</h4>
      <p>
        The F5 BIG-IP Virtual Edition will enable you to setup a client-to-site
        full tunnel VPN to connect to your management/edge VPC and/or a web
        application firewall (WAF) to enable consumers to connect to your
        workload VPC over the public internet.{" "}
      </p>
      <p>
        Through IBM Secure Landing Zone, users can optionally provision the F5
        BIG-IP so that one can either setup the implemented solution of a
        client-to-site VPN or web application firewall (WAF) which is described{" "}
        <a
          href="https://cloud.ibm.com/docs/allowlist/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-f5-tutorial"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>{" "}
      </p>
      <h4 id="-optional-bastion-host-using-teleport">
        Bastion host using Teleport
      </h4>
      <p>
        <a
          href="https://goteleport.com/docs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Teleport
        </a>{" "}
        allows you to configure a virtual server instance in a VPC as a bastion
        host. Some of Teleport features include Single sign-on to access the SSH
        server, auditing, and recording of your interactive sessions. To learn
        more about teleport, see the following{" "}
        <a
          href="https://goteleport.com/docs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          documentation
        </a>
        .
      </p>
      <p>
        Through IBM Secure Landing Zone, users can optionally{" "}
        <a
          href="https://us-south.git.cloud.ibm.com/open-toolchain/landing-zone/-/blob/main/.docs/bastion/bastion.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          provision the implemented solution
        </a>{" "}
        which configures a bastion host in your VPC using Teleport Enterprise
        Edition, along with provisioning a Object Storage bucket and App ID for
        enhanced security.{" "}
        <a
          href="https://cloud.ibm.com/docs/appid"
          target="_blank"
          rel="noopener noreferrer"
        >
          App ID
        </a>{" "}
        will be used to authenticate users to access teleport. Teleport session
        recordings will be stored in the Object Storage bucket.
      </p>
      <hr />
      <p>
        Related links
        <br />
        <a
          href="https://ibm.box.com/s/hy5svbs3r5it4o5ut2dak98hgfqn3wul"
          target="_blank"
          rel="noopener noreferrer"
        >
          FAQ
        </a>{" "}
      </p>
    </div>
  );
};

export default About;
