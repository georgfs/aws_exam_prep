# AWS Exam Simulator
Welcome to the AWS Exam Simulator! This open-source JavaScript application is designed to help aspiring AWS professionals prepare for AWS certification exams with confidence.
[🚀 Try it! Live Demo](https://www.pontonline.com.br/exam/)

# Main features:
- You can use as many question databases as you want.
- Set how many questions each exam simulation will have.
- Time counter to help you keep track of exam duration.
- Questions can have multiple correct answers (choices).
- Statistics and wrong-answered questions are reported at the end of each exam.

# Installation
- Upload source files to your local or remote web server's index folder.

# Questions (.set files)
- The app reads database files with the ".set" extension stored in the "questions" subdirectory.
- These ".set" files are plain text markdown (MD) formatted. Consider "AWS.set" as an example.
- Consider question choice(s) prefixed with "- [x]" as correct ones and "- [ ]" as incorrect ones.
- Each question must have at least one or more correct choices.
