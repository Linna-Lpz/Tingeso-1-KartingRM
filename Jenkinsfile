pipeline{
    agent any
    tools{
        maven "maven"
    }
    stages{
        stage("Build JAR File"){
            steps{
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/Linna-Lpz/Tingeso-1-KartingRM']])
                dir("kartingBackend"){
                    bat "mvn clean install"
                }
            }
        }
        stage("Test"){
            steps{
                dir("kartingBackend"){
                    bat "mvn test"
                }
            }
        }        
        stage("Build and Push Docker Image"){
            steps{
                dir("kartingBackend"){
                    script{
                        bat "docker context use default"
                         withDockerRegistry(credentialsId: 'docker-credentials'){
                            bat "docker build -t calpz/karting-backend-image ."
                            bat "docker push calpz/karting-backend-image"
                        }
                    }                    
                }
            }
        }
    }
}