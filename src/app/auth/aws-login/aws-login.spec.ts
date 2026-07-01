import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AwsLogin } from "./aws-login";

describe("AwsLogin", () => {
  let component: AwsLogin;
  let fixture: ComponentFixture<AwsLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwsLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(AwsLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
