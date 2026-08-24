#!/usr/bin/env -S node --experimental-strip-types
import { create } from "../src/cli.ts"
create(process.argv.slice(2))
