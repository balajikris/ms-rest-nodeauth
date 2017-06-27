// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import { TokenCredentialsBase } from "./TokenCredentialsBase";
import * as adal from "adal-node/*";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";

export class UserTokenCredentials extends TokenCredentialsBase {

  private readonly tokenCache: any;
  private readonly isGraphContext: boolean;
  private readonly authContext: any;

  public constructor(
    private readonly clientId: string,
    private readonly domain: string,
    private readonly username: string,
    private readonly password: string,
    private readonly tokenAudience?: TokenAudience,
    private readonly environment: AzureEnvironment = AzureEnvironment.Default) {

    super();

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

  /**
   * Tries to get the token from cache initially. If that is unsuccessful then it tries to get the token from ADAL.
   * @returns {Promise<object>}
   * {object} [tokenResponse] The tokenResponse (tokenType and accessToken are the two important properties).
   * @memberof UserTokenCredentials
   */
  public async getToken(): Promise<any> {
    try {
      return this.getTokenFromCache();
    } catch (error) {

      const self = this;

      // TODO: extract this repeated code into a helper.
      const resource = this.isGraphContext
        ? this.environment.activeDirectoryGraphResourceId
        : this.environment.activeDirectoryResourceId;

      return new Promise((resolve, reject) => {
        self.authContext.acquireTokenWithUsernamePassword(resource, self.username, self.password, self.clientId,
          (error: any, tokenResponse: any) => {
            if (error) {
              return reject(error);
            }
            return resolve(tokenResponse);
          });
      });
    }
  }

  // TODO: move to base class, also requires moving common fields/props down to base.
  private getTokenFromCache(): Promise<any> {

    const self = this;
    const resource = self.isGraphContext
      ? this.environment.activeDirectoryGraphResourceId
      : this.environment.activeDirectoryResourceId;

    return new Promise((resolve, reject) => {
      self.authContext.acquireToken(resource, self.username, self.clientId, (error: any, tokenResponse: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(tokenResponse);
      });
    });
  }
}
