// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import { TokenCredentialsBase } from "./TokenCredentialsBase";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";
import { AuthConstants } from "./AuthConstants";

export class DeviceTokenCredentials extends TokenCredentialsBase {

  private readonly userName: string;

  public constructor(
    clientId: string,
    domain: string,
    userName?: string,
    tokenAudience?: TokenAudience,
    environment?: AzureEnvironment) {

    if (!userName) {
      userName = "user@example.com";
    }

    if (!domain) {
      domain = AuthConstants.AAD_COMMON_TENANT;
    }

    if (!clientId) {
      clientId = AuthConstants.DEFAULT_ADAL_CLIENT_ID;
    }

    super(clientId, domain, tokenAudience, environment);

    this.userName = userName;
  }

  public getToken(): Promise<any> {
    // For device auth, this is just getTokenFromCache.
    return this.getTokenFromCache(this.userName);
  }
}
