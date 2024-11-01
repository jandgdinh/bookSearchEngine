// Removed unused imports
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { removeBookId } from '../utils/localStorage';

// Import necessary modules and types
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import type { Book } from '../models/Book';

const SavedBooks = () => {
  // Use useQuery to fetch user data
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || { savedBooks: [] };

  // Initialize the removeBook mutation
  const [removeBook, { error }] = useMutation(REMOVE_BOOK, {
    // Optional: Update the cache directly
    update(cache, { data: { removeBook } }) {
      cache.modify({
        fields: {
          me(existingMe = {}) {
            const newSavedBooks = existingMe.savedBooks.filter(
              (book: Book) => book.bookId !== removeBook.bookId
            );
            return { ...existingMe, savedBooks: newSavedBooks };
          },
        },
      });
    },
  });

  const handleDeleteBook = async (bookId: string) => {
    try {
      await removeBook({
        variables: { bookId },
      });

      // Remove book ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle loading state
  if (loading) {
    return <h2>Loading...</h2>;
  }

  // Handle error state
  if (error) {
    console.error('Error:', error);
  }

  return (
    <>
      <div className="text-light bg-dark">
        <Container>
          <h1>Your Saved Books</h1>
        </Container>
      </div>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`Cover of ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">
                    Authors: {book.authors?.join(', ')}
                  </p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this book
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
