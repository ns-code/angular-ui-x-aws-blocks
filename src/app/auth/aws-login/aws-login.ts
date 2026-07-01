import { Component, inject, OnInit, signal } from "@angular/core";
import { form, FormField, required } from "@angular/forms/signals"
import { AuthUser } from "@aws-blocks/blocks";
import { AwsBlocksClient } from "../../service/aws-blocks-client";

@Component({
  selector: "app-aws-login",
  imports: [FormField],
  templateUrl: "./aws-login.html",
  styleUrl: "./aws-login.css",
})
export class AwsLogin implements OnInit {
    awsSvcClient = inject(AwsBlocksClient);
    loginUser = signal<AuthUser | undefined | null>(null);
    errMsg = signal<string>('');
    btnLbl = signal<string>('SignIn');
  
    readonly user = signal({
      username: '',
      password: ''
    });
    readonly usr = form(this.user,
      schema => {
        required(schema.username, {
          message: 'Required field'
        });
        required(schema.password, {
          message: 'Required field'
        });
      });
  
    public ngOnInit(): void {
      this.setLoginUser();
    }
  
    private setLoginUser() {
      this.awsSvcClient.getLoginUser()
        .then((authUser) => {
          this.loginUser.set(authUser);
        })
        .catch((err) => {
          console.error("Failed to load login user:", err);
          this.loginUser.set(null);
        });
    }
  
    public login() {
      const newUser = this.usr().value();
      this.awsSvcClient.login(newUser.username, newUser.password)
        .then((authState) => {
          if (authState.error) {
            this.errMsg.set(authState.error);
          } else {
            this.loginUser.set(authState.user);
          }
        })
        .catch((err) => this.errMsg.set(err));
    }

    public register() {
      const newUser = this.usr().value();
      this.awsSvcClient.register(newUser.username, newUser.password)
        .then((authState) => {
          if (authState.error) {
            this.errMsg.set(authState.error);
          } else {
            this.loginUser.set(authState.user);
          }
        })
        .catch((err) => this.errMsg.set(err));
    }    
  
    public logout() {
      this.awsSvcClient.logout()
        .then((authState) => {
          console.log(">> Logout success");
          this.loginUser.set(null);
        })
        .catch((err) => this.errMsg.set(err));
    }

    public signInForm() {
      this.btnLbl.set('SignIn');
    }

    public signUpForm() {
      this.btnLbl.set('SignUp');
    }
  
}
