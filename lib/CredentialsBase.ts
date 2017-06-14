// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import * as msRest from "../../ms-rest/lib/msRest";

export abstract class CredentialsBase {
  public abstract getToken(): string;

  public signRequest(webResource: msRest.WebResource): Promise<msRest.WebResource> {
    const token = this.getToken();
    const headerConstants = msRest.Constants.HeaderConstants;
    webResource.headers[headerConstants.AUTHORIZATION] = `${headerConstants.AUTHORIZATION_SCHEME} ${token}`;
    return Promise.resolve(webResource);
  }
}
