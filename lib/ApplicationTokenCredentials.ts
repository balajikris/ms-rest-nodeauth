// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import { TokenCredentialsBase } from "./TokenCredentialsBase";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";
import { AuthConstants } from "./AuthConstants";

export class ApplicationTokenCredentials extends TokenCredentialsBase {

  private readonly secret: string;

  public constructor(
    clientId: string,
    domain: string,
    secret: string,
    tokenAudience?: TokenAudience,
    environment?: AzureEnvironment) {

    super(clientId, domain, tokenAudience, environment);

    this.secret = secret;
  }

  public getToken(): Promise<any> {
    return this.getTokenFromCache()
      .then((tokenResponse) => tokenResponse)
      .catch((error) => {
        if (error.message.startsWith(AuthConstants.SDK_INTERNAL_ERROR)) {
          return Promise.reject(error);
        }

        const resource = this.getActiveDirectoryResourceId();
        return new Promise((resolve, reject) => {
          this.authContext.acquireTokenWithClientCredentials(resource, this.clientId, this.secret,
            (error: any, tokenResponse: any) => {
              if (error) {
                return reject(error);
              }
              return resolve(tokenResponse);
            });
        });
      });
  }

  protected getTokenFromCache(): Promise<any> {
    const self = this;

    // a thin wrapper over the base implementation. try get token from cache, additionaly clean up cache if required.
    return super.getTokenFromCache(undefined)
      .then((tokenResponse) => tokenResponse)
      .catch((error) => {
        // Remove the stale token from the tokencache. ADAL gives the same error message "Entry not found in cache."
        // for entry not being present in the cache and for accessToken being expired in the cache. We do not want the token cache
        // to contain the expired token, we clean it up here.
        self.removeInvalidItemsFromCache({ _clientId: self.clientId })
          .then(() => Promise.reject(error))
          .catch((reason) => {
            Promise.reject(new Error(AuthConstants.SDK_INTERNAL_ERROR + " : "
              + "critical failure while removing expired token for service principal from token cache"
              + reason.message));
          });
      });
  }

  private removeInvalidItemsFromCache(query: object): Promise<boolean> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.tokenCache.find(query, (error: any, entries: any) => {
        if (error) {
          return reject(error);
        }

        if (entries && entries.length > 0) {
          return resolve(self.tokenCache.remove(entries, () => resolve(true)));
        } else {
          return resolve(true);
        }
      });
    });
  }
}
