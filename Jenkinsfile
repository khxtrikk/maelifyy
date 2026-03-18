pipeline {
    agent any

    environment {
        AWS_REGION         = 'ap-south-1'
        ECR_REGISTRY       = '041659741300.dkr.ecr.ap-south-1.amazonaws.com'
        BACKEND_IMAGE      = "${ECR_REGISTRY}/mealify-backend"
        FRONTEND_IMAGE     = "${ECR_REGISTRY}/mealify-frontend"
        ADMIN_IMAGE        = "${ECR_REGISTRY}/mealify-admin"
        K3S_SERVER_IP      = '13.205.41.20'
        //K3S_SSH_KEY        = credentials('k3s-ssh-key')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGODB_URI',       variable: 'MONGODB_URI'),
                    string(credentialsId: 'JWT_SECRET',        variable: 'JWT_SECRET'),
                    string(credentialsId: 'STRIPE_SECRET_KEY', variable: 'STRIPE_SECRET_KEY')
                ]) {
                    sh '''
                        docker build \
                          --build-arg MONGODB_URI="$MONGODB_URI" \
                          --build-arg JWT_SECRET="$JWT_SECRET" \
                          --build-arg STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
                          -t $BACKEND_IMAGE:$BUILD_NUMBER \
                          -t $BACKEND_IMAGE:latest \
                          ./backend

                        docker build \
                          -t $FRONTEND_IMAGE:$BUILD_NUMBER \
                          -t $FRONTEND_IMAGE:latest \
                          ./frontend

                        docker build \
                          -t $ADMIN_IMAGE:$BUILD_NUMBER \
                          -t $ADMIN_IMAGE:latest \
                          ./admin
                    '''
                }
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID',     variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

                        aws ecr get-login-password --region $AWS_REGION | \
                          docker login --username AWS --password-stdin $ECR_REGISTRY

                        docker push $BACKEND_IMAGE:$BUILD_NUMBER
                        docker push $BACKEND_IMAGE:latest
                        docker push $FRONTEND_IMAGE:$BUILD_NUMBER
                        docker push $FRONTEND_IMAGE:latest
                        docker push $ADMIN_IMAGE:$BUILD_NUMBER
                        docker push $ADMIN_IMAGE:latest
                    '''
                }
            }
        }

        // stage('Deploy to k3s') {
        //     steps {
        //         sh '''
        //             ssh -o StrictHostKeyChecking=no \
        //                 -i $K3S_SSH_KEY \
        //                 ubuntu@$K3S_SERVER_IP \
        //                 "kubectl set image deployment/backend  backend=$BACKEND_IMAGE:$BUILD_NUMBER  -n mern && \
        //                  kubectl set image deployment/frontend frontend=$FRONTEND_IMAGE:$BUILD_NUMBER -n mern && \
        //                  kubectl set image deployment/admin    admin=$ADMIN_IMAGE:$BUILD_NUMBER    -n mern"
        //         '''
        //     }
        // }
    }

    post {
        success {
            echo 'Pipeline completed successfully — all 3 apps deployed!'
        }
        failure {
            echo 'Pipeline failed — check the logs above.'
        }
    }
}