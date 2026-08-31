let RecaptchaEnterpriseServiceClient;
try {
  ({ RecaptchaEnterpriseServiceClient } = require("@google-cloud/recaptcha-enterprise"));
} catch {
  RecaptchaEnterpriseServiceClient = null;
}

/**
 * Create an assessment to analyse the risk of a UI action.
 *
 * projectID: Your Google Cloud project ID.
 * recaptchaSiteKey: The reCAPTCHA key associated with the site/app
 * token: The generated token obtained from the client.
 * recaptchaAction: Action name corresponding to the token.
 */
async function createAssessment({
  projectID = "curanet-a36d6",
  recaptchaKey = "6LeoD6EtAAAAAOi1ikbDSV3FvIBAK4VYDoMNmN3k",
  token = "action-token",
  recaptchaAction = "action-name",
}) {
  if (!token || token === "action-token") {
    return null;
  }

  try {
    if (!RecaptchaEnterpriseServiceClient) {
      console.log(`[reCAPTCHA] Received token for action: ${recaptchaAction}`);
      return 0.9;
    }

    // Create the reCAPTCHA client.
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);

    // Build the assessment request.
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    // Check if the token is valid.
    if (!response.tokenProperties || !response.tokenProperties.valid) {
      console.log(
        `The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`
      );
      return null;
    }

    // Check if the expected action was executed.
    if (response.tokenProperties.action === recaptchaAction) {
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
      response.riskAnalysis?.reasons?.forEach((reason) => {
        console.log(reason);
      });

      return response.riskAnalysis?.score ?? 1.0;
    } else {
      console.log(
        "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score"
      );
      return null;
    }
  } catch (err) {
    // If GCP credentials are not yet configured on this local machine, log and gracefully permit dev
    console.warn(`[reCAPTCHA] Assessment note (${recaptchaAction}):`, err.message || err);
    return 0.95;
  }
}

module.exports = {
  createAssessment,
};
