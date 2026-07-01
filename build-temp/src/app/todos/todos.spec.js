import { TestBed } from "@angular/core/testing";
import { Todos } from "./todos";
describe("Todos", () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Todos],
        }).compileComponents();
        fixture = TestBed.createComponent(Todos);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });
    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
