import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
jest.mock('./config/api', () => ({
  API_BASE_URL: 'http://localhost:8000',
}));
jest.mock('./components/SongList', () => function SongListMock() {
  return <main>Song list route</main>;
});

test('renders the song list route', () => {
  window.history.pushState({}, 'Songs', '/songs');

  render(<App />);

  expect(screen.getByText('Song list route')).toBeInTheDocument();
});
