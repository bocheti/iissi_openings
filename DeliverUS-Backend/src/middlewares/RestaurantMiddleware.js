import { Restaurant, Order } from '../models/models.js'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}
const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkRestaurantToToggle = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId, {
      attributes: { exclude: ['userId'] },
      include: [{
        model: Order,
        as: 'orders'
      }]
    })
    if (!(restaurant.status === 'online' || restaurant.status === 'offline')) {
      return res.status(422).send('Cannot toggle the status of a closed restaurant')
    }
    if (restaurant.orders.some(order => order.status === 'pending')) {
      return res.status(422).send('Cannot toggle the status of a restaurant with pending orders')
    }
    return next()
  } catch (err) {
    return res.status(500).send(err)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkRestaurantToToggle }
