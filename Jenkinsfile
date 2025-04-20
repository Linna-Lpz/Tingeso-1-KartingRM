pipeline{
    agent any
    tools{
        maven "maven"
    }
    stages{
        stage("Build JAR File"){
            steps{
                checkout scmGit(branches: [[name: '*/main']], etensions: [], userRemoteConfigs: [[url: 'https://github.com/Linna-Lpz/Tingeso-1-KartingRM']])
                dir('kartingBackend'){
                    bat "mvn clean install"
                }
            }
        }
        stage("Test"){
            steps{
                dir('kartingBackend'){
                    bat "mvn test"
                }
            }
        }
        stage("Build and Push Docker Image"){
            steps{
                dir("kartingBackend"){
                    script{
                        withDockerRegistry(credentialsId: 'docker-credentials'){
                            bat "docker build -t calpz/kartingBackend ."
                            bat "docker push calpz/kartingBackend"
                        }
                    }
                }
            }
        }
    }
}