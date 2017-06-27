// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import { Constants as MSRestConstants, WebResource } from "../../ms-rest/lib/msRest";

export abstract class TokenCredentialsBase {
  // TODO: need a constructor here that does common things.

  public async abstract getToken(): Promise<any>; // TODO: should this be a string?

  public async signRequest(webResource: WebResource): Promise<WebResource> {
    const token = await this.getToken();
    webResource.headers[MSRestConstants.HeaderConstants.AUTHORIZATION] = `${token.tokenType} ${token.accessToken}`;
    return Promise.resolve(webResource);
  }
}
