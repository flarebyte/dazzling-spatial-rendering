import test from "tape"
import dazzlingSpatialRendering from "../src"

test("dazzlingSpatialRendering", (t) => {
  t.plan(1)
  t.equal(true, dazzlingSpatialRendering(), "return true")
})
