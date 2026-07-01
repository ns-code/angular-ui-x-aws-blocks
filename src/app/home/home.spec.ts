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
      // provideLibraryConfig({
      //   authEndpoint: '/users/authenticate',
      //   initialPage: '/'
      // })
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

  it('should render ', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menucolContainer = compiled.querySelector('.awsLoginView');

    expect(menucolContainer).not.toBeNull(); // ✅ Ensure the element exists
    expect(menucolContainer?.textContent).toContain('Page 1'); // ✅ Safe to assert now
  });
});


