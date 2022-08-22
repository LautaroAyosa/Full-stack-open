const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /json/)
})

test('There are six blogs', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('The blog list contains a title called TDD harms architecture', async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)
  expect(titles).toContain('TDD harms architecture')
})

test("The unique identifying property of blog posts is called 'id' instead of '_id'", async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0]).toHaveProperty('id')
})

test('A valid blog can be added', async () => {
  const newBlog = {
    title: 'How to Use Stereo Cameras to See in 3D!',
    author: 'Andrew Blance',
    url: 'https://medium.com/better-programming/how-to-use-stereo-cameras-to-see-in-3d-8dfd955a1824',
    likes: 7
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(r => r.title)
  expect(titles).toContain(
    'How to Use Stereo Cameras to See in 3D!'
  )
})

test('Add likes=0 if the property likes is not passed', async () => {
  const newBlog = {
    title: 'How to Use Stereo Cameras to See in 3D!',
    author: 'Andrew Blance',
    url: 'https://medium.com/better-programming/how-to-use-stereo-cameras-to-see-in-3d-8dfd955a1824'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  expect(blogsAtEnd[helper.initialBlogs.length]).toHaveProperty('likes', 0)

  const titles = blogsAtEnd.map(r => r.title)
  expect(titles).toContain(
    'How to Use Stereo Cameras to See in 3D!'
  )
})

afterAll(() => {
  mongoose.connection.close()
})
