import pytest
from unittest.mock import MagicMock, patch
import os
from migrate_sqlite_to_mysql import migrate

# Mock the database engines and sessions
@patch("migrate_sqlite_to_mysql.create_engine")
@patch("migrate_sqlite_to_mysql.sessionmaker")
def test_migration_logic(mock_sessionmaker, mock_create_engine):
    # Setup Mocks
    mock_sqlite_engine = MagicMock()
    mock_mysql_engine = MagicMock()
    
    # When create_engine is called:
    # 1st call -> SQLite, 2nd call -> MySQL
    mock_create_engine.side_effect = [mock_sqlite_engine, mock_mysql_engine]

    # Setup Sessions
    mock_sqlite_session = MagicMock()
    mock_mysql_session = MagicMock()
    
    # Session() constructor returns our mock sessions
    # 1st call -> SQLite session, 2nd call -> MySQL session
    mock_session_class = MagicMock()
    mock_session_class.side_effect = [mock_sqlite_session, mock_mysql_session]
    mock_sessionmaker.return_value = mock_session_class

    # Mock Data in SQLite
    # We'll pretend there is 1 User record
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.__tablename__ = "users"
    
    # query(model).all() returns [mock_user]
    mock_sqlite_session.query.return_value.all.return_value = [mock_user]

    # Make target DB empty (returns None when checking for existence)
    mock_mysql_session.query.return_value.filter.return_value.first.return_value = None

    # Set Environment Variable for the test
    os.environ["MYSQL_DATABASE_URL"] = "mysql+pymysql://mock:mock@localhost/mockrpc"

    # Run Migration
    try:
        migrate()
    except SystemExit:
        pytest.fail("Migration script called sys.exit() unexpectedly")

    # Assertions
    # 1. Check Engines Created
    assert mock_create_engine.call_count == 2
    
    # 2. Check Data Transfer
    # Should query SQLite
    assert mock_sqlite_session.query.called
    # Should add to MySQL
    mock_mysql_session.add.assert_called_with(mock_user)
    # Should commit
    assert mock_mysql_session.commit.called

    print("✅ Migration Logic Verified via Mocking")
