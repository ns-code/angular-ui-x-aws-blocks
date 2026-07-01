import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';

import { describe, test, expect, beforeEach, it } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create home component', () => {
    expect(component).toBeTruthy();
  });

  test('should render ', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menucolContainer = compiled.querySelector('.homeview');

    expect(menucolContainer).not.toBeNull(); // ✅ Ensure the element exists
    expect(menucolContainer?.textContent).toContain('Home'); // ✅ Safe to assert now
  });
});


