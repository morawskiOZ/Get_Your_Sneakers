import CartCount from "../components/CartCount"
import { shallow, mount } from "enzyme"
import toJSON from "enzyme-to-json"
import SingleItem, { SINGLE_ITEM_QUERY } from "../components/SingleItem"
import wait from "waait"
import { MockedProvider } from "react-apollo/test-utils"
import { fakeItem } from "../lib/testUtils"

describe("<SingleItem />", () => {
  it("redners with proper data", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: {
          data: {
            item: fakeItem()
          }
        }
      }
    ]
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    )
    expect(wrapper.text()).toContain("Loading...")
    await wait()
    wrapper.update()
    expect(toJSON(wrapper.find("h2"))).toMatchSnapshot()
  })
  it("errors with a not found item", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: {
          errors: [{ message: "Item not found" }]
        }
      }
    ]
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    const item = wrapper.find('[data-test="graphql-error"]')
    expect(item.text()).toContain("Shoot!Item not found")
    expect(toJSON(item)).toMatchSnapshot()
  })
})
