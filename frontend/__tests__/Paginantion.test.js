import { mount } from "enzyme"
import Pagination, { PAGINATION_QUERY } from "../components/Pagination"
import wait from "waait"
import toJSON from "enzyme-to-json"
import Router from "next/router"
import { MockedProvider } from "react-apollo/test-utils"

Router.router = {
  push() {},
  prefetch() {}
}

function makeMockFor(length) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: "aggregate",
            aggregate: {
              __typename: "count",
              count: length
            }
          }
        }
      }
    }
  ]
}

describe("<Pagination />", () => {
  it("displays a loading message", () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMockFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    )
    expect(wrapper.text()).toContain("Loading")
  })

  it("renders pagination fro 18 items", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMockFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    const pagination = wrapper.find("div[data-test='pagination']")
    expect(toJSON(pagination)).toMatchSnapshot()
  })
})
