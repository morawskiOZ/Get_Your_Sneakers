import { mount } from "enzyme"
import PleaseSignin from "../components/PleaseSignin"
import wait from "waait"
import { MockedProvider } from "react-apollo/test-utils"
import { fakeUser } from "../lib/testUtils"
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

describe("<PleaseSignedIn>", () => {
  it("redners the sing in dialog to logged out user", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignin />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.text()).toContain("Please Sign in")
    const SignIn = wrapper.find("Signin")
    expect(SignIn.exists()).toBe(true)
  })
  it("render the child component when the user is signed in ", async () => {
    const Test = () => <p>Hey!</p>
    const wrapper = mount(
      <MockedProvider mocks={signedInMock}>
        <PleaseSignin>
          <Test />
        </PleaseSignin>
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    console.log(wrapper.debug())
    expect(wrapper.find("Test").exists()).toBe(true)
    expect(wrapper.contains(<Test />)).toBe(true)
  })
})
