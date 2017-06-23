// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

"use strict";
import { EnvironmentConstants } from "./EnvironmentConstants";

export class AzureEnvironment {

  public static Default = EnvironmentConstants.Default as AzureEnvironment;
  public readonly validateAuthority = true;

  private constructor(
    public readonly name: string,
    public readonly portalUrl: string,
    public readonly publishingProfileUrl: string,
    public readonly managementEndpointUrl: string,
    public readonly resourceManagerEndpointUrl: string,
    public readonly sqlManagementEndpointUrl: string,
    public readonly sqlServerHostnameSuffix: string,
    public readonly galleryEndpointUrl: string,
    public readonly activeDirectoryEndpointUrl: string,
    public readonly activeDirectoryResourceId: string,
    public readonly activeDirectoryGraphResourceId: string,
    public readonly activeDirectoryGraphApiVersion: string,
    public readonly storageEndpointSuffix: string,
    public readonly keyVaultDnsSuffix: string,
    public readonly azureDataLakeStoreFileSystemEndpointSuffix: string,
    public readonly azureDataLakeAnalyticsCatalogAndJobEndpointSuffix: string) {
  }

  // public get name(): string {
  //   return this._name;
  // }

  // public get portalUrl(): string {
  //   return this._portalUrl;
  // }

  // public get publishingProfileUrl(): string {
  //   return this._publishingProfileUrl;
  // }

  // public get managementEndpointUrl(): string {
  //   return this._managementEndpointUrl;
  // }

  // public get resourceManagerEndpointUrl(): string {
  //   return this._resourceManagerEndpointUrl;
  // }

  // public get sqlManagementEndpointUrl(): string {
  //   return this._sqlManagementEndpointUrl;
  // }

  // public get sqlServerHostnameSuffix(): string {
  //   return this._sqlServerHostnameSuffix;
  // }

  // public get galleryEndpointUrl(): string {
  //   return this._galleryEndpointUrl;
  // }

  // public get activeDirectoryEndpointUrl(): string {
  //   return this._activeDirectoryEndpointUrl;
  // }

  // public get activeDirectoryResourceId(): string {
  //   return this._activeDirectoryResourceId;
  // }

  // public get activeDirectoryGraphResourceId(): string {
  //   return this._activeDirectoryGraphResourceId;
  // }

  // public get activeDirectoryGraphApiVersion(): string {
  //   return this._activeDirectoryGraphApiVersion;
  // }

  // public get storageEndpointSuffix(): string {
  //   return this._storageEndpointSuffix;
  // }

  // public get keyVaultDnsSuffix(): string {
  //   return this._keyVaultDnsSuffix;
  // }

  // public get azureDataLakeStoreFileSystemEndpointSuffix(): string {
  //   return this._azureDataLakeStoreFileSystemEndpointSuffix;
  // }

  // public get azureDataLakeAnalyticsCatalogAndJobEndpointSuffix(): string {
  //   return this._azureDataLakeAnalyticsCatalogAndJobEndpointSuffix;
  // }

}
