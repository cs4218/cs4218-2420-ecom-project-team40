import mongoose from 'mongoose';
import connectDB from './db';

jest.mock('mongoose');
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Database Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.MONGO_URL = 'mongodb://test-url';
    });

    it('should successfully connect to the database', async () => {
        const mockConnection = {
            connection: {
                host: 'test-host'
            }
        };
        mongoose.connect.mockResolvedValueOnce(mockConnection);
        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('Connected To db')
        );
    });

    it('should log connection errors', async () => {
        const mockError = new Error('Connection failed');
        mongoose.connect.mockRejectedValueOnce(mockError);
        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('Error in db connection: Connection failed')
        );
    });
}); 