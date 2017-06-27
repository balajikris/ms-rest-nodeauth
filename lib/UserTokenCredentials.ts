// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import { TokenCredentialsBase } from "./TokenCredentialsBase";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";

export class UserTokenCredentials extends TokenCredentialsBase {

  private readonly username: string;
  private readonly password: string;

  public constructor(
    clientId: string,
    domain: string,
    username: string,
    password: string,
    tokenAudience?: TokenAudience,
    environment?: AzureEnvironment) {

    super(clientId, domain, tokenAudience, environment);

    this.username = username;
    this.password = password;
  }

  /**
   * Tries to get the token from cache initially. If that is unsuccessful then it tries to get the token from ADAL.
   * @returns {Promise<object>}
   * {object} [tokenResponse] The tokenResponse (tokenType and accessToken are the two important properties).
   * @memberof UserTokenCredentials
   */
  public async getToken(): Promise<any> {
    try {
      return this.getTokenFromCache(this.username);
    } catch (error) {

      const self = this;
      const resource = this.getActiveDirectoryResourceId();

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
}
