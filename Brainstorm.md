## Features

### Document upload (Module 1)
- Users can upload a handwritten note/assignment. We will use some sort of OCR technology to convert it into text
- ***Cohere Classify*** used to classify it into notes or assessment
- That note is stored in a database. 
- The file structure for the end user will be:
  - Notebook
	  - Files

### File Storage
- We have to store those files and their structure into a database.

### Authentication
- Each user will have different files, so we need an authentication system

### Summarizer (Module 2)
- ***Cohere Summarize*** used to summarize notes
- Maybe a parameter to how many words the summary should be in order not to make it too long/short

### Flashcard/Mock Exam Generator (Module 3)
??? How to accomplish?

### Chat Interface
- Ability to chat about documents
- Uses ***Cohere RAG model*** to cite sources from notes when answering questions
- Need to figure out the scope of the data fed into the model. Can user only ask questions within 1 document or can questions span across multiple documents
- Integration with other modules
	- Uses ***LangChain Agents*** to allow for this interfacing

### Some kind of integration with Dall-E 3?

