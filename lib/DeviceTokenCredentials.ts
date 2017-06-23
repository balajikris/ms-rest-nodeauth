// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import * as msRest from "../../ms-rest/lib/msRest";
import { CredentialsBase } from "./CredentialsBase";
import * as adal from "adal-node/*";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";

export class DeviceTokenCredentials extends CredentialsBase {

  private readonly tokenCache: any;
  private readonly isGraphContext: boolean;
  private readonly authContext: any;

  public constructor(
    private readonly clientId: string,
    private readonly domain: string,
    private readonly authorizationScheme?: string,
    private readonly tokenAudience?: TokenAudience,
    private readonly environment: AzureEnvironment = AzureEnvironment.Default) {

    super();

    if (!this.authorizationScheme) {
      this.authorizationScheme = msRest.Constants.HeaderConstants.AUTHORIZATION_SCHEME;
    }

    if (this.tokenAudience === TokenAudience.graph) {
      this.isGraphContext = true;

      if (this.domain.toLowerCase() === "common") {
        throw new Error(`${"If the tokenAudience is specified as \"graph\" then \"domain\" cannot be defaulted to \"commmon\" tenant.\
          It must be the actual tenant (preferrably a string in a guid format)."}`);
      }


      this.tokenCache = new adal.MemoryCache();
      const authorityUrl = this.environment.activeDirectoryEndpointUrl + this.domain;
      this.authContext = new adal.AuthenticationContext(authorityUrl, this.environment.validateAuthority, this.tokenCache);
    }
  }
}
