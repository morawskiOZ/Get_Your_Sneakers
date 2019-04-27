import ItemComponent from "../components/Item"
import { shallow, mount } from "enzyme"
import toJSON from "enzyme-to-json"

const fakeItem = {
  id: "ABC123",
  title: "A Cool Item",
  price: 4000,
  description: "This item is really cool!",
  image: "dog.jpg",
  largeImage: "largedog.jpg"
}

// describe("Item", () => {
//   it("renders and displays properly", () => {
//     const wrapper = shallow(<ItemComponent item={fakeItem} />)
//     const PriceTag = wrapper.find("PriceTag")
//     expect(PriceTag.children().text()).toBe("$40")
//   })
// })

describe("Item", () => {
  it("renders and matches the snapshot", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    expect(toJSON(wrapper)).toMatchSnapshot()
  })
})
