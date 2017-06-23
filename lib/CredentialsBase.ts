// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import * as msRest from "../../ms-rest/lib/msRest";

export abstract class CredentialsBase {
  // TODO: need a constructor here that does common things.

  public async abstract getToken(): Promise<any>; // TODO: should this be a string?

  public async signRequest(webResource: msRest.WebResource): Promise<msRest.WebResource> {
    const token = await this.getToken();
    const headerConstants = msRest.Constants.HeaderConstants;
    webResource.headers[headerConstants.AUTHORIZATION] = `${token.tokenType} ${token.accessToken}`;
    return Promise.resolve(webResource);
  }
}
