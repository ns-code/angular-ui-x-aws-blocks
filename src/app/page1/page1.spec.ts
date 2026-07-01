
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { describe, test, expect, beforeEach, it } from 'vitest';
import { provideRouter } from '@angular/router';

import { Page1 } from "./page1";

describe("Page1", () => {
  let component: Page1;
  let fixture: ComponentFixture<Page1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page1],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Page1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  test("should create", () => {
    expect(component).toBeTruthy();
  });

  test('should render ', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menucolContainer = compiled.querySelector('#page1view');

    expect(menucolContainer).not.toBeNull(); // ✅ Ensure the element exists
    expect(menucolContainer?.textContent).toContain('page1 works!'); // ✅ Safe to assert now
  });  
});
