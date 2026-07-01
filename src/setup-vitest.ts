import '@testing-library/jest-dom';
// src/test-setup.ts
// import setupAngular from '@analogjs/vitest-angular';

// import '@analogjs/vitest-angular/setup-zone'; // Or setup-snapshots for zoneless apps
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { platformBrowserTesting } from '@angular/platform-browser/testing';

// setupAngular();

TestBed.initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);