function Person(name, foods) {
  this.name = name
  this.foods = foods
}

Person.prototype.fetchFacFoods = function() {
  return new Promise((resolve, reject) => {
    // simulate API
    setTimeout(() => {
      resolve(this.foods)
    }, 20000)
  })
}

describe("mocking lesson", () => {
  it("mocks a reg fun", () => {
    const fetchDogs = jest.fn()
    fetchDogs()
    expect(fetchDogs).toHaveBeenCalled()
  })

  it("fetch foods", async () => {
    const me = new Person("piotr", ["pizza"])
    me.fetchFacFoods = jest.fn().mockResolvedValue(["pizza"])
    const favFoods = await me.fetchFacFoods()
    expect(favFoods).toContain("pizza")
  })
})
