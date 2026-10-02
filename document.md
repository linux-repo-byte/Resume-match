# Top Five High-Impact Algorithms

This document covers the five most important algorithms in the resume analysis and job matching workflow.

## 1. Skill Extraction by Alias Matching

### Algorithm Name
Rule-based skill extraction with alias matching.

### Purpose
Identifies technical and domain skills in resume text so the platform can measure a candidate's skill coverage against job requirements.

### Use Case
Implemented in `backend/services/skillExtractionService.js`. It scans cleaned resume text against the local skill dataset in `backend/config/skillDataset.js` and records each matched skill, category, and occurrence count.

### Pseudo Code

```text
FUNCTION extractSkills(text, skillDataset):
    source <- convert text to a string
    results <- empty list

    FOR each skill in skillDataset:
        aliases <- skill aliases if available, otherwise the skill name
        occurrences <- 0

        FOR each alias in aliases:
            pattern <- escaped, case-insensitive whole-term pattern for alias
            occurrences <- occurrences + number of matches in source

        IF occurrences is greater than zero:
            add skill name, category, and occurrences to results

    RETURN results
```

### Explanation
The algorithm uses a known dictionary instead of trying to infer skills semantically. Each skill can have multiple aliases, such as abbreviations or alternate spellings. Regular-expression boundary checks prevent partial matches inside unrelated words. A skill is included once at least one alias appears in the resume.

## 2. TF-IDF Vectorization

### Algorithm Name
Smoothed Term Frequency-Inverse Document Frequency (TF-IDF).

### Purpose
Converts resume and job-description text into weighted numeric vectors. Terms that are important within a document but uncommon across the compared documents receive greater weight.

### Use Case
Implemented in `backend/services/tfidf.js` and used by `backend/services/matchingEngine.js` to represent the candidate resume and combined job text before similarity comparison.

### Pseudo Code

```text
FUNCTION createTFIDFVectors(documents):
    termFrequencies <- calculate normalized term frequencies for every document
    vocabulary <- union of all terms in all documents
    vectors <- empty list

    FOR each documentFrequencyMap in termFrequencies:
        vector <- empty map

        FOR each term in vocabulary:
            documentFrequency <- number of documents containing term
            inverseDocumentFrequency <-
                log((number of documents + 1) /
                    (documentFrequency + 1)) + 1
            vector[term] <- termFrequency(term) * inverseDocumentFrequency

        add vector to vectors

    RETURN vectors
```

### Explanation
First, the text is tokenized and each term's frequency is divided by the document's token count. The algorithm then calculates smoothed inverse document frequency across the compared documents. Multiplying these values produces vectors that emphasize useful vocabulary overlap while reducing the influence of terms appearing everywhere.

## 3. Cosine Similarity

### Algorithm Name
Cosine similarity for text vectors.

### Purpose
Measures how closely a resume's weighted vocabulary matches a job description's weighted vocabulary, while reducing the effect of different document lengths.

### Use Case
Implemented in `backend/services/cosineSimilarity.js`. The matching engine applies it to the TF-IDF vectors for a resume and a job, then converts the result into a percentage-style similarity score.

### Pseudo Code

```text
FUNCTION cosineSimilarity(leftVector, rightVector):
    terms <- union of terms in both vectors
    dotProduct <- 0
    leftMagnitude <- 0
    rightMagnitude <- 0

    FOR each term in terms:
        leftValue <- value for term in leftVector, or zero
        rightValue <- value for term in rightVector, or zero
        dotProduct <- dotProduct + leftValue * rightValue
        leftMagnitude <- leftMagnitude + leftValue squared
        rightMagnitude <- rightMagnitude + rightValue squared

    IF either magnitude is zero:
        RETURN zero

    RETURN dotProduct /
           (square root of leftMagnitude * square root of rightMagnitude)
```

### Explanation
The algorithm calculates the dot product of the two vectors and divides it by the product of their magnitudes. A result near 1 indicates strong alignment in vocabulary, while a result near 0 indicates little overlap. Empty or zero-valued vectors return zero safely instead of causing a division-by-zero error.

## 4. Weighted Skill Matching

### Algorithm Name
Required and preferred skill weighted-set matching.

### Purpose
Calculates how well a candidate's extracted skills satisfy a job's explicit requirements. Required skills contribute more than preferred skills by default.

### Use Case
Implemented in `backend/services/skillMatcher.js`. It compares resume skill names with `requiredSkills` and `preferredSkills` from a job, and also produces matched and missing skill lists for recruiter-facing results.

### Pseudo Code

```text
FUNCTION matchSkills(candidateSkills, job):
    candidateNames <- normalized names of candidate skills
    required <- job required skills with default weight 2
    preferred <- job preferred skills with default weight 1
    requirements <- required followed by preferred
    totalWeight <- sum of all requirement weights
    matched <- requirements whose names appear in candidateNames

    IF totalWeight is zero:
        score <- 100
    ELSE:
        score <- 100 * sum of matched weights / totalWeight

    missing <- required skills whose names do not appear in candidateNames
    RETURN score, unique matched names, unique missing required names
```

### Explanation
Candidate and job skill names are normalized by trimming whitespace and ignoring letter case. The algorithm checks membership using a set, so each requirement is either matched or unmatched. Required skills have a default weight of two, preferred skills have a default weight of one, and the weighted coverage is converted to a score from 0 to 100.

## 5. Weighted Resume-to-Job Matching

### Algorithm Name
Composite weighted matching engine.

### Purpose
Combines several independent signals into one compatibility score that can be used to rank resumes against jobs.

### Use Case
Implemented in `backend/services/matchingEngine.js`. It is used when candidates view job compatibility and when recruiters review applications. The engine combines skill coverage, text similarity, experience matching, and education matching.

### Pseudo Code

```text
FUNCTION matchResumeToJob(resumeText, resumeAnalysis, job, weights):
    jobText <- concatenate job title, description, required skills,
               preferred skills, and education requirement

    resumeVector, jobVector <- create TF-IDF vectors for resumeText and jobText
    skillScore <- match candidate skills against job skills
    experienceScore <- match candidate experience against required experience
    educationScore <- match candidate education against education requirement
    similarityScore <- cosine similarity of resumeVector and jobVector * 100

    finalScore <- skillScore * weights.skill
                + similarityScore * weights.similarity
                + experienceScore * weights.experience
                + educationScore * weights.education

    RETURN component scores, finalScore, matched skills, and missing skills
```

### Explanation
The engine first builds one searchable job text from both free-form and structured job fields. It then calculates four separate signals: explicit skill coverage, vocabulary similarity, experience fulfillment, and education fulfillment. Finally, it applies configured weights and adds the results. The default configuration gives the greatest influence to skills, while retaining the individual component scores so the final recommendation remains explainable.

## Matching Workflow

```text
Resume file
    -> cleaned resume text
    -> extracted skills
    -> TF-IDF resume vector
    -> cosine similarity and explicit skill matching
    -> composite compatibility score with job requirements
```
