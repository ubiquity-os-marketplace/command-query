import { Type as T } from "@sinclair/typebox";
import { StaticDecode } from "@sinclair/typebox";

export const commandSchema = T.Object({
  name: T.Literal("query", { description: "Returns the user's wallet, access, and multiplier information.", examples: ["/query @UbiquityOS"] }),
  parameters: T.Object({
    username: T.String(),
  }),
});

export type Command = StaticDecode<typeof commandSchema>;
