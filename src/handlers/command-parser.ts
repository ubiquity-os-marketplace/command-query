import { InvalidArgumentError, program } from "@commander-js/extra-typings";
import packageJson from "../../package.json";
import { Context } from "../types/context";
import { queryUser } from "./query-user";

export class CommandParser {
  readonly _program;

  constructor(context: Context) {
    program
      .command("/query")
      .usage("@<username>")
      .argument("<username>", "User name to query, e.g. @ubiquibot", this._parseUser)
      .action((username) => queryUser(context, username))
      .version(packageJson.version);

    // Overrides to make sure we do not use TTY outputs as they are not available outside Node.js env
    program.configureOutput({
      writeOut(str: string) {
        console.log(str);
      },
      writeErr(str: string) {
        console.error(str);
      },
      getErrHelpWidth(): number {
        return 0;
      },
      getOutHelpWidth(): number {
        return 0;
      },
    });

    program.exitOverride();

    this._program = program;
  }

  parse(args: string[]) {
    return this._program.parseAsync(args, { from: "user" });
  }

  _parseUser(value: string) {
    if (!value.length || value.length < 2) {
      throw new InvalidArgumentError("Username should be at least 2 characters long.");
    }
    if (value[0] !== "@") {
      throw new InvalidArgumentError("Username should start with @.");
    }
    // Remove @ character
    return value.slice(1);
  }
}

export default program;
