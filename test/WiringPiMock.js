module.exports = {
  wiringPiSetupGpio: function () {},
  pinMode: function () {},
  pullUpDnControl: function () {},
  digitalRead: function () { return Math.floor(Math.random() * 2) },
  digitalWrite: function () {},
  OUTPUT: 0,
  INPUT: 0,
  PUD_UP: 0
}
