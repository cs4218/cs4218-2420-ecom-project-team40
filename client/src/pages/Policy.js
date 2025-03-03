import React from "react";
import Layout from "./../components/Layout";

const Policy = () => {
  return (
    <Layout title={"Privacy Policy"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/contactus.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4 p-2">
          <p>
            This website collects data from users for the purposes of
            facilitating the services rendered by Virtual Vault.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Policy;
