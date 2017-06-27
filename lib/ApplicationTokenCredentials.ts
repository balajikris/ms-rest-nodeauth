// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import * as adal from "adal-node/*";
import { TokenCredentialsBase } from "./TokenCredentialsBase";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";
import { AuthConstants } from "./AuthConstants";

export class ApplicationTokenCredentials extends TokenCredentialsBase {

  private readonly tokenCache: any;
  private readonly isGraphContext: boolean;
  private readonly authContext: any;

  public constructor(
    private readonly clientId: string,
    private readonly domain: string,
    private readonly secret: string,
    private readonly tokenAudience?: TokenAudience,
    private readonly environment = AzureEnvironment.Default) {

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

  // TODO: The only difference between this and UserTokenCreds is what adal function we invoke
  // share the implementation by taking what adal-func to call as an argument -- implement getToken(func) in base class.
  public getToken(): Promise<any> {
    try {
      return this.getTokenFromCache();
    } catch (error) {
      if (error.message.startsWith(AuthConstants.SDK_INTERNAL_ERROR)) {
        return Promise.reject(error);
      }

      // TODO: extract this repeated code into a helper.
      const resource = this.isGraphContext
        ? this.environment.activeDirectoryGraphResourceId
        : this.environment.activeDirectoryResourceId;

      return new Promise((resolve, reject) => {
        this.authContext.acquireTokenWithClientCredentials(resource, this.clientId, this.secret,
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
      this.authContext.acquireToken(resource, undefined, self.clientId, (error: any, tokenResponse: any) => {
        if (error) {
          // Remove the stale token from the tokencache. ADAL gives the same error message "Entry not found in cache."
          // for entry not being present in the cache and for accessToken being expired in the cache. We do not want the token cache
          // to contain the expired token, we clean it up here.
          return self.removeInvalidItemsFromCache({ _clientId: self.clientId })
            .then(() => reject(error))
            .catch((reason: any) => reject(new Error(AuthConstants.SDK_INTERNAL_ERROR + " : "
              + "critical failure while removing expired token for service principal from token cache"
              + reason.message)));
        }

        return resolve(tokenResponse);
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
