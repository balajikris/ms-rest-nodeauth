// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import * as adal from "adal-node/*";
import { TokenCredentialsBase } from "./TokenCredentialsBase";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";
import { AuthConstants } from "./AuthConstants";

export class DeviceTokenCredentials extends TokenCredentialsBase {

  private readonly tokenCache: any;
  private readonly isGraphContext: boolean;
  private readonly authContext: any;

  public constructor(
    private readonly clientId: string,
    private readonly domain: string,
    private readonly tokenAudience?: TokenAudience,
    private readonly userName = "user@example.com",
    private readonly environment = AzureEnvironment.Default) {

    super();

    if (!this.domain) {
      this.domain = AuthConstants.AAD_COMMON_TENANT;
    }

    if (!this.clientId) {
      this.clientId = AuthConstants.DEFAULT_ADAL_CLIENT_ID;
    }

    if (this.tokenAudience === TokenAudience.graph) {
      this.isGraphContext = true;

      if (this.domain.toLowerCase() === "common") {
        throw new Error(`${"If the tokenAudience is specified as \"graph\" then \"domain\" cannot be defaulted to \"commmon\" tenant.\
          It must be the actual tenant (preferrably a string in a guid format)."}`);
      }
    }

    this.tokenCache = new adal.MemoryCache();
    const authorityUrl = this.environment.activeDirectoryEndpointUrl + this.domain;
    this.authContext = new adal.AuthenticationContext(authorityUrl, this.environment.validateAuthority, this.tokenCache);
  }

  public getToken(): Promise<any> {

    const self = this;
    const resource = this.isGraphContext
      ? this.environment.activeDirectoryGraphResourceId
      : this.environment.activeDirectoryResourceId;

    return new Promise((resolve, reject) => {
      self.authContext.acquireToken(resource, self.userName, self.clientId, (error: any, tokenResponse: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(tokenResponse);
      });
    });
  }
}
