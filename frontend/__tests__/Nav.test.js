import { mount } from "enzyme"
import Nav from "../components/Nav"
import wait from "waait"
import toJSON from "enzyme-to-json"
import { MockedProvider } from "react-apollo/test-utils"
import { fakeUser, fakeCartItem } from "../lib/testUtils"
import { CURRENT_USER_QUERY } from "../components/User"

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
]

const signedInMock = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
]
const SignedInMocksWithCartItem = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()]
        }
      }
    }
  }
]
describe("<Nav />", () => {
  it("renders a minimal nav when signed out", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    const nav = wrapper.find('ul[data-test="nav"]')
    expect(toJSON(nav)).toMatchSnapshot()
  })
  it("renders full nav ehen signed in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMock}>
        <Nav />
      </MockedProvider>
    )
    await wait()
    wrapper.update()

    const nav = wrapper.find('ul[data-test="nav"]')
    expect(nav.children().length).toBe(6)
    expect(nav.text()).toContain("Sign Out")
  })
  it("renders the amount of items in the cart", async () => {
    const wrapper = mount(
      <MockedProvider mocks={SignedInMocksWithCartItem}>
        <Nav />
      </MockedProvider>
    )
    await wait()
    wrapper.update()

    const nav = wrapper.find('[data-test="nav"]')
    const count = nav.find("div.count")
    expect(toJSON(count)).toMatchSnapshot()
  })
})
