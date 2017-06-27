// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";

import { Constants as MSRestConstants, WebResource } from "../../ms-rest/lib/msRest";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";
import * as adal from "adal-node/*";

export abstract class TokenCredentialsBase {

  protected readonly tokenCache: any;
  protected readonly isGraphContext: boolean;
  protected readonly authContext: any;

  public constructor(
    protected readonly clientId: string,
    protected readonly domain: string,
    protected readonly tokenAudience?: TokenAudience,
    protected readonly environment = AzureEnvironment.Default) {

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

  protected getActiveDirectoryResourceId(): Promise<string> {
    const resource = this.isGraphContext
      ? this.environment.activeDirectoryGraphResourceId
      : this.environment.activeDirectoryResourceId;

    return Promise.resolve(resource);
  }

  protected getTokenFromCache(userName: string): Promise<any> {
    const self = this;
    const resource = this.getActiveDirectoryResourceId();

    return new Promise((resolve, reject) => {
      self.authContext.acquireToken(resource, userName, self.clientId, (error: any, tokenResponse: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(tokenResponse);
      });
    });
  }

  public async abstract getToken(): Promise<any>; // TODO: should this be a string?

  public async signRequest(webResource: WebResource): Promise<WebResource> {
    const token = await this.getToken();
    webResource.headers[MSRestConstants.HeaderConstants.AUTHORIZATION] = `${token.tokenType} ${token.accessToken}`;
    return Promise.resolve(webResource);
  }
}
