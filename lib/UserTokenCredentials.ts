// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import * as msRest from "../../ms-rest/lib/msRest";
import { CredentialsBase } from "./CredentialsBase";
import * as adal from "adal-node/*";
import { AzureEnvironment } from "./AzureEnvironment";
import { TokenAudience } from "./TokenAudience";

export class UserTokenCredentials extends CredentialsBase {

  private readonly tokenCache: any;
  public constructor(
    private readonly clientId: string,
    private readonly domain: string,
    private readonly username: string,
    private readonly password: string,
    private readonly tokenAudience?: TokenAudience,
    private readonly environment?: AzureEnvironment = AzureEnvironment.Default) {

    super();

    if (this.tokenAudience) {

      // convert enum to string before using.
      // if (typeof this.tokenAudience === "number") {
      //   let tokenAudienceStr = TokenAudience[tokenAudience];
      // }

      if (this.domain.toLowerCase() === "common") {
        throw new Error(`${"If the tokenAudience is specified as \"graph\" then \"domain\" cannot be defaulted to \"commmon\" tenant.\
          It must be the actual tenant (preferrably a string in a guid format)."}`);
      }
    }

    this.tokenCache = new adal.MemoryCache();


  }

  public getToken(): string {
    throw new Error("Method not implemented.");
  }

  private getTokenFromCache(): Promise<string> {
    return new Promise((resolve, reject) => {
      adal.acquireToken("stuff", (error: any, result: any) => {
        if (error) {
          return reject(error);
        }

        return resolve(result.accessToken);
      });
    });
  }

}
