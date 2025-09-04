// Define the Event type (we need to do this for all api calls, and also complex state objects e.g form data)

export interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  flexibility: string;
  priority?: number;
  userId: string;
  createdAt: string;
}